import { Todo } from "../entities/todo";
import { TodoRepository } from "../repositories/TodoRepository";



export class GetAllTodos {
    constructor(private todoRepository: TodoRepository) {}
    async execute(): Promise<Todo[]> {
        return await this.todoRepository.getAll();
    }
}