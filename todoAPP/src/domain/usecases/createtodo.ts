import { Todo,CreateTodoDTO } from "../entities/todo";
import { TodoRepository } from "../repositories/TodoRepository";

export class CreateTodo {
    constructor(private todoRepository: TodoRepository) {}
    async execute(data: CreateTodoDTO): Promise<Todo> {
        if (!data.title.trim()) {
            throw new Error("Titulo es requerido");
        }
        if (data.title.length > 200) {
            throw new Error("Titulo demasiado largo");
        }           
        return await this.todoRepository.create(data);
    }
}