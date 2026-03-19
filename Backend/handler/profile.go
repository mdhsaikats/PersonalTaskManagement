package handler

import (
	"encoding/json"
	"net/http"

	"main.go/database"
	"main.go/model"
	"main.go/util"
)

func GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid method", http.StatusInternalServerError)
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

	var profile model.Profile

	query := `SELECT email 
			FROM users 
			WHERE id = ?;`

	err = database.DB.QueryRow(query, userID).Scan(&profile.Email)
	if err != nil {
		http.Error(w, "Invalid Query", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"email":  profile.Email,
	})

}
