package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"main.go/database"
	"main.go/model"
	"main.go/util"
)

func GetAllProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var userID int

	token := util.GetTokenFromHeader(r)
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	email, err := util.ParseToken(token)
	if err != nil {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	err = database.DB.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}
	var project []model.GetAllProject
	query := `SELECT 
	p.id,
    p.title,
	IFNULL(p.description, ''),
	IFNULL(CAST(p.status AS CHAR), '0'),
    p.created_at,
    COUNT(t.id) AS total_task,
    IFNULL(
        ROUND(
            (SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) * 100.0) 
            / NULLIF(COUNT(t.id), 0), 2
        ), 0
    ) AS project_progress
	FROM project p
	LEFT JOIN task t ON t.project_id = p.id
	WHERE p.user_id = ?
	GROUP BY p.id;`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		http.Error(w, "error to query on database", http.StatusInternalServerError)
		fmt.Print(err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var pr model.GetAllProject
		err = rows.Scan(&pr.Id, &pr.Title, &pr.Description, &pr.Status, &pr.CreatedAt, &pr.TotalTask, &pr.ProjectProgress)
		if err != nil {
			http.Error(w, "Invalid Scan", http.StatusInternalServerError)
			fmt.Print(err)
			return
		}
		project = append(project, pr)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"project": project,
	})

}

func CreateNewProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var project model.CreateNewProject

	err := json.NewDecoder(r.Body).Decode(&project)
	if err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	var userID int

	token := util.GetTokenFromHeader(r)
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	email, err := util.ParseToken(token)
	if err != nil {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	err = database.DB.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}

	query := `INSERT INTO project (title,description,status,user_id) VALUES (?,?,?,?)`

	_, err = database.DB.Exec(query, project.Title, project.Description, 1, userID)
	if err != nil {
		http.Error(w, "invalid query to the database", http.StatusInternalServerError)
		fmt.Print(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "successfully project created",
	})
}
func DeleteProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	// 🔥 Get ID from URL
	idStr := strings.TrimPrefix(r.URL.Path, "/project/")
	projectID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid project id", http.StatusBadRequest)
		return
	}

	// -------- AUTH --------
	token := util.GetTokenFromHeader(r)
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	email, err := util.ParseToken(token)
	if err != nil {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	var userID int
	err = database.DB.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}

	// -------- DELETE --------
	query := `DELETE FROM project WHERE id = ? AND user_id = ?`
	result, err := database.DB.Exec(query, projectID, userID)
	if err != nil {
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		http.Error(w, "project not found", http.StatusNotFound)
		return
	}

	// -------- RESPONSE --------
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
	})
}

func EditProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var userID int
	var req model.EditProject
	token := util.GetTokenFromHeader(r)
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}
	email, err := util.ParseToken(token)
	if err != nil {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}
	err = database.DB.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}
	idStr := chi.URLParam(r, "id")
	query := `UPDATE project SET title = ?, description = ? WHERE id = ? AND user_id = ?`
	_, err = database.DB.Exec(query, req.Title, req.Description, idStr, userID)
	if err != nil {
		http.Error(w, "Invalid database query", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "successfully project edited",
	})
}
