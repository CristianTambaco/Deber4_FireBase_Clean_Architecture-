export interface Todo {   
    id: string;   
    title: string;   
    completed: boolean;   
    createdAt: Date;   
    userId: string; // ID del usuario dueño de esta tarea 
}  


export interface CreateTodoDTO {   
    title: string;   
    userId: string; // Requerido al crear una tarea 
}  


export interface UpdateTodoDTO {   
    id: string;   
    completed?: boolean;   
    title?: string; 
  // userId NO es editable (no queremos cambiar el dueño) 
} 
