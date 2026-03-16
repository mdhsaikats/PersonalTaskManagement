package handler

import (
	"encoding/json"
	"net/http"

	"main.go/database"
	"main.go/model"
	"main.go/util"
)

func DashboardHeader(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodGet{
		http.Error(w,"Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	var dh model.DashboardHeader
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

	query := `
	SELECT COUNT(t.id) AS task_count
	FROM project p
	LEFT JOIN task t ON p.id = t.project_id
	WHERE p.user_id = ?;
	`
	err = database.DB.QueryRow(query, userID).Scan(&dh.TotalTask)
	if err != nil{
		http.Error(w,"Internal Server Error",http.StatusInternalServerError)
		return
	}

	query1 := `SELECT COUNT(t.id) AS task_count
	FROM project p
	LEFT JOIN task t ON p.id = t.project_id
	WHERE p.user_id = ? && t.status = 'in_progress';
	`
	err = database.DB.QueryRow(query1, userID).Scan(&dh.InProgress)
	if err != nil{
		http.Error(w,"Internal server error", http.StatusInternalServerError)
		return
	}

	query2 := `SELECT COUNT(t.id) AS task_count
	FROM project p
	LEFT JOIN task t ON p.id = t.project_id
	WHERE p.user_id = ? && t.status = 'completed';`

	err = database.DB.QueryRow(query2, userID).Scan(&dh.Completed)
	if err != nil{
		http.Error(w,"Internal server error",http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type","application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"total_tasks": dh.TotalTask,
		"in_progress": dh.InProgress,
		"completed": dh.Completed,
	})

}

func TodaysTasks(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodGet{
		http.Error(w,"Invalid Method",http.StatusMethodNotAllowed)
		return
	}

	var userID int
	var tt model.TodaysTask

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

	
	query := `SELECT t.title AS task_title
		FROM project p
		LEFT JOIN task t ON p.id = t.project_id
		WHERE p.user_id = ?
		AND DATE(t.due_date) = CURDATE();
		`
	err = database.DB.QueryRow(query,userID).Scan(&tt.TaskTitle)
	if err != nil{
		http.Error(w,"Internal server error",http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type","application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"task_title": tt.TaskTitle,
	})

}