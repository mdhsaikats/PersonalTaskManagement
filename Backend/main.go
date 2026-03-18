package main

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"main.go/database"
	"main.go/handler"
	"main.go/util"
)

func main() {
	//database connection
	db := database.Database()
	defer db.Close()

	//api routers
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Use(middleware.Logger)
	r.Get("/", handler.ServerHealth)
	r.Post("/login", handler.LoginUsers)
	r.Post("/registration", handler.RegistrationUser)
	r.Post("/logout", handler.LogoutUsers)
	r.Route("/dashboard", func(r chi.Router) {
		r.Use(util.VerifyTokenMiddleware())
		r.Get("/header", handler.DashboardHeader)
		r.Get("/todaystask", handler.TodaysTasks)
		r.Get("/project-status", handler.ProjectProgress)
	})

	//server listening
	err := http.ListenAndServe(":3000", r)
	if err != nil {
		fmt.Println("Server crushed")
	} else {
		fmt.Println("Server Started")
	}
}
