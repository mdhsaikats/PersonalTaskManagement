package handler

import (
	"encoding/json"
	"net/http"

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
    p.title,
    p.description,
    p.status,
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
		return
	}
	defer rows.Close()

	for rows.Next() {
		var pr model.GetAllProject
		err = rows.Scan(&pr.Title, &pr.Description, &pr.Status, &pr.CreatedAt, &pr.TotalTask, &pr.ProjectProgress)
		if err != nil {
			http.Error(w, "Invalid Scan", http.StatusInternalServerError)
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
