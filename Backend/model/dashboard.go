package model

type DashboardHeader struct {
	TotalTask  int `json:"total_task"`
	InProgress int `json:"in_progress"`
	Completed  int `json:"completed"`
}

type RecentActivity struct {
	Header    string `json:"header"`
	CreatedAt string `json:"created_at"`
}

type Upcoming struct {
	Title string `json:"title"`
}

type ProjectProgress struct {
	TotalTasks int `json:"total_task"`
	TaskDone   int `json:"task_done"`
}