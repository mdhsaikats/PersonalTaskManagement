package model

// CalendarEvent represents a task returned for the calendar view.
type CalendarEvent struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Date        string  `json:"date"`
	StartTime   string  `json:"start_time"`
	EndTime     string  `json:"end_time"`
	Status      string  `json:"status"`
	Description *string `json:"description,omitempty"`
	ProjectName string  `json:"project_name"`
}
