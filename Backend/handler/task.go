package handler

import (
	"encoding/json"
	"net/http"

	"main.go/database"
	"main.go/model"
	"main.go/util"
)

func GetAllTask(w http.ResponseWriter, r *http.Request) {
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

	var task []model.Task
	query := `SELECT t.id, t.title , t.description , t.status FROM task t
    		JOIN project p ON  p.id = t.project_id
    		WHERE user_id = ?;`
	rows, err := database.DB.Query(query, userID)
	if err != nil {
		http.Error(w, "Invalid Query to the database", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var alltask model.Task
		err = rows.Scan(&alltask.Id, &alltask.Title, &alltask.Description, &alltask.Status)
		if err != nil {
			http.Error(w, "Scan Error", http.StatusInternalServerError)
			return
		}
		task = append(task, alltask)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"task":   task,
	})

}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var task model.CreateTask
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	if task.ProjectId == 0 || task.Title == "" {
		http.Error(w, "missing project_id or title", http.StatusBadRequest)
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

	var projectCount int
	err = database.DB.QueryRow(`SELECT COUNT(*) FROM project WHERE id = ? AND user_id = ?`, task.ProjectId, userID).Scan(&projectCount)
	if err != nil {
		http.Error(w, "Invalid Database query", http.StatusInternalServerError)
		return
	}

	if projectCount == 0 {
		http.Error(w, "project not found for user", http.StatusBadRequest)
		return
	}

	insertQuery := `INSERT INTO task (project_id, title, description, due_date) VALUES (?,?,?,?)`
	_, err = database.DB.Exec(insertQuery, task.ProjectId, task.Title, task.Description, task.DueDate)
	if err != nil {
		http.Error(w, "Invalid Database query", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "successfully task created on desire project",
	})

}

func UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var userID int
	var updatetask model.UpgradeTask
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

	err = json.NewDecoder(r.Body).Decode(&updatetask)
	if err != nil {
		http.Error(w, "Invalid json", http.StatusBadRequest)
		return
	}

	query := `UPDATE task t
        JOIN project p ON t.project_id = p.id
        SET t.status = ?
        WHERE t.id = ? AND p.user_id = ?`
	_, err = database.DB.Exec(query, updatetask.Status, updatetask.Id, userID)
	if err != nil {
		http.Error(w, "Invalid database query", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "successfully task is updated",
	})

}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var userID int
	var req struct {
		Id int `json:"id,string"`
	}
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
	query := `DELETE FROM task WHERE id = ? AND project_id IN (SELECT id FROM project WHERE user_id = ?)`
	_, err = database.DB.Exec(query, req.Id, userID)
	if err != nil {
		http.Error(w, "Invalid database query", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "successfully task deleted",
	})
}

func EditTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}
	var userID int
	var req struct {
		Id          int    `json:"id,string"`
		Title       string `json:"title"`
		Description string `json:"description"`
		DueDate     string `json:"due_date"`
	}
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
	query := `UPDATE task SET title = ?, description = ?, due_date = ? WHERE id = ? AND project_id IN (SELECT id FROM project WHERE user_id = ?)`
	_, err = database.DB.Exec(query, req.Title, req.Description, req.DueDate, req.Id, userID)
	if err != nil {
		http.Error(w, "Invalid database query", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "successfully task edited",
	})
}
