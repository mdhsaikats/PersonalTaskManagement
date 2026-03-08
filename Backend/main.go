package main

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"main.go/database"
	"main.go/handler"
)

func main() {
	//database connection
	db := database.Database()
	defer db.Close()


	//api routers
    r := chi.NewRouter()
    r.Use(middleware.Logger)
    r.Get("/", handler.ServerHealth)
	r.Post("/login", handler.LoginUsers)
	r.Post("/registration",handler.RegistrationUser)
	r.Post("/logout",handler.LogoutUsers)

	//server listening
    err := http.ListenAndServe(":3000", r)
	if err != nil {
		fmt.Println("Server crushed")
	}else{
		fmt.Println("Server Started")
	}
}
