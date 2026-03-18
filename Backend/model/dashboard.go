package model

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
