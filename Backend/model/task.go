package model

type Task struct {
	Id          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

type CreateTask struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	DueDate     string `json:"due_date"`
	ProjectId   int    `json:"project_id"`
}

type UpgradeTask struct {
	Id     int    `json:"id,string"`
	Status string `json:"status"`
}
