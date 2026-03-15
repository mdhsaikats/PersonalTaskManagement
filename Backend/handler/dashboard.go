package handler

import (
	"net/http"

	"main.go/model"
)

func main(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodGet{
		http.Error(w,"Invalid Method", http.StatusMethodNotAllowed)
		return
	}

	var dh model.DashboardHeader
	query := `SELECT COUNT()`
}