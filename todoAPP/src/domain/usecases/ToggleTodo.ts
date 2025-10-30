import  { Todo } from "../entities/todo";
import { TodoRepository } from "../repositories/TodoRepository";


export class ToggleTodo {
    constructor(private todoRepository: TodoRepository) {}
    async execute(id: string): Promise<Todo> {
        const todo = await this.todoRepository.getById(id);
        if (!todo) {
            throw new Error("Todo no encontrado");
        }
        return await this.todoRepository.update({
            id,
            completed: !todo.completed,
        });
    } 
}