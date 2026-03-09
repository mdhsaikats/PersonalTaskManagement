package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"main.go/database"
	"main.go/model"
	"main.go/util"
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

var existingEmail string
query1 := `SELECT email FROM users WHERE email = ?`
err := database.DB.QueryRow(query1, userregistration.Email).Scan(&existingEmail)
if err == nil {
	http.Error(w, `{"message": "Email already exists"}`, http.StatusConflict)
	return
}

query := `INSERT INTO users (email,password) VALUES (?,?)`

_, err = database.DB.Exec(query, userregistration.Email, userregistration.Password)
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

	token, err := util.CreateToken(userlogin.Email)
	if err != nil {
    	fmt.Println("Error creating the token")
    	return
	}

	var userID int
	query2 := `SELECT id FROM users WHERE email = ?`
	err = database.DB.QueryRow(query2,userlogin.Email).Scan(&userID)
	if err != nil{
		http.Error(w, `"massage": "Invalid to get the user_id"`, http.StatusInternalServerError)
		return
	} 
	
	query1 := `INSERT INTO session (token,user_id) VALUES (?,?)`
	_,err = database.DB.Exec(query1,token,userID)
	if err != nil {
		http.Error(w,"Invalid to enter the session and the user id to the session table",http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"message": "login successfully",
		"token": token,
	})
	
}

func LogoutUsers(w http.ResponseWriter,r *http.Request){
	if r.Method != http.MethodPost{
		http.Error(w,"Invalid method", http.StatusMethodNotAllowed)
		return
	}

	AuthHeader := util.GetTokenFromHeader(r)

	if AuthHeader == ""{
		http.Error(w,"Token missing",http.StatusUnauthorized)
		return
	}

	email, err := util.ParseToken(AuthHeader)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	var userID int
	query := `SELECT id FROM users WHERE email = ?`
	err = database.DB.QueryRow(query,email).Scan(&userID)
	if err != nil{
		http.Error(w, `"massage": "Invalid to get the user_id"`, http.StatusInternalServerError)
		return
	} 
	query1 := `DELETE from session WHERE user_id = ?`
	_,err = database.DB.Exec(query1,userID)
	if err != nil {
		http.Error(w,"Invalid to delete the session", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"Logout successful"}`))

}