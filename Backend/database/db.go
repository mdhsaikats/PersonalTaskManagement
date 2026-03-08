package database

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Database() *sql.DB {
	dsn := "root:29112003@tcp(localhost:3306)/taskmanager"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Database not reachable: ", err)
	}

	DB = db
	log.Println("Database connected successfully")
	return db
}