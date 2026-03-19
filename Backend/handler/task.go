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
	query := `SELECT t.title , t.description , t.status FROM task t
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
		err = rows.Scan(&alltask.Title, &alltask.Description, &alltask.Status)
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
