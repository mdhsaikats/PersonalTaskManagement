package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func Database() *sql.DB {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found, using system environment variables")
	}

	user := getEnv("DB_USER", "root")
	password := getEnv("DB_PASSWORD", "")
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "3306")
	database := getEnv("DB_NAME", "taskmanager")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", user, password, host, port, database)

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

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
