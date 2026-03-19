package model

type GetAllProject struct {
	Id              int     `json:"id"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	Status          string  `json:"status"`
	TotalTask       int     `json:"total_task"`
	CreatedAt       string  `json:"created_at"`
	ProjectProgress float64 `json:"project_progress"`
}

type CreateNewProject struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}
