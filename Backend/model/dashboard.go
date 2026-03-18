package model

import "time"

type DashboardHeader struct {
	TotalTask  int `json:"total_task"`
	InProgress int `json:"in_progress"`
	Completed  int `json:"completed"`
}

type TodaysTask struct {
	TaskTitle string `json:"task_title"`
}

type ProjectProgress struct {
	ProjectTitle   string `json:"project_title"`
	ProgressStatus string `json:"progress_status"`
}

type UpcomingDeadlines struct {
	Title    string     `json:"title"`
	DueDate  *time.Time `json:"due_date"`
	Priority string     `json:"priority"`
}
