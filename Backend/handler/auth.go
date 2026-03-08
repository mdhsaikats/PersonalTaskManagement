package handler

import (
	"encoding/json"
	"net/http"

	"main.go/database"
	"main.go/model"
)


func RegistrationUser(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodPost{
		http.Error(w,"Invalid Method",http.StatusMethodNotAllowed)
		return
	}
var userregistration model.RegistrationUsers
if err := json.NewDecoder(r.Body).Decode(&userregistration); err != nil {
	http.Error(w,"Invalid JSON",http.StatusBadRequest)
	return
}

query := `INSERT INTO users (email,password) VALUES (?,?)`

_,err := database.DB.Exec(query, userregistration.Email, userregistration.Password)
if err != nil{
	http.Error(w,"Invalid To Access database",http.StatusInternalServerError)
	return
}
w.WriteHeader(http.StatusCreated)
w.Write([]byte(`{"massage": "User registration successfully"}`))


}

func LoginUsers(w http.ResponseWriter, r *http.Request ){
	if r.Method != http.MethodPost{
		http.Error(w,"Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	var userlogin model.LoginUsers
	if err := json.NewDecoder(r.Body).Decode(&userlogin); err != nil{
		http.Error(w,"Invalid JSON",http.StatusBadRequest)
		return
	}

	var dbPassword string
	query := `SELECT password FROM users WHERE email = ?`
	err := database.DB.QueryRow(query, userlogin.Email).Scan(&dbPassword)
	if err != nil {
		http.Error(w, `{"message": "Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	if dbPassword != userlogin.Password {
		http.Error(w, `{"message": "Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Login successful"}`))
}