package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"main.go/database"
	"main.go/model"
	"main.go/util"
)

func GetCalenderInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid Method", http.StatusMethodNotAllowed)
		return
	}

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

	var userID int
	if err := database.DB.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&userID); err != nil {
		http.Error(w, "user not found", http.StatusUnauthorized)
		return
	}

	monthParam := r.URL.Query().Get("month")
	var startDate, endDate *time.Time
	if monthParam != "" {
		parsed, parseErr := time.Parse("2006-01", monthParam)
		if parseErr != nil {
			http.Error(w, "invalid month format, expected YYYY-MM", http.StatusBadRequest)
			return
		}
		s := parsed
		e := parsed.AddDate(0, 1, 0)
		startDate = &s
		endDate = &e
	}

	query := `
    SELECT 
        t.id,
        t.title,
        DATE(t.due_date) AS date,
        TIME(t.due_date) AS start_time,
        ADDTIME(TIME(t.due_date), '01:00:00') AS end_time,
        t.status,
        t.description,
        p.title AS project_name
    FROM task t
    JOIN project p ON t.project_id = p.id
    WHERE p.user_id = ?`

	args := []interface{}{userID}
	if startDate != nil && endDate != nil {
		query += " AND DATE(t.due_date) >= ? AND DATE(t.due_date) < ?"
		args = append(args, startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))
	}

	query += " ORDER BY t.due_date ASC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var events []model.CalendarEvent
	for rows.Next() {
		var ev model.CalendarEvent
		var date sql.NullString
		var start sql.NullString
		var end sql.NullString
		var desc sql.NullString

		if err := rows.Scan(&ev.ID, &ev.Title, &date, &start, &end, &ev.Status, &desc, &ev.ProjectName); err != nil {
			http.Error(w, "scan error", http.StatusInternalServerError)
			return
		}

		if date.Valid {
			ev.Date = date.String
		}
		if start.Valid {
			ev.StartTime = start.String
		}
		if end.Valid {
			ev.EndTime = end.String
		}
		if desc.Valid {
			ev.Description = &desc.String
		}

		events = append(events, ev)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "row iteration error", http.StatusInternalServerError)
		return
	}

	respMonth := monthParam
	if respMonth == "" {
		respMonth = time.Now().Format("2006-01")
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"month":  respMonth,
		"events": events,
	})
}
