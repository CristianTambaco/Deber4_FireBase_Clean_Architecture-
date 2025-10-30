import { Todo,CreateTodoDTO,UpdateTodoDTO } from "../entities/todo";

  

export interface TodoRepository{
    getAll():Promise<Todo[]>;
    getById (id:string):Promise<Todo | null>;
    create (todo:CreateTodoDTO):Promise<Todo>;
    update (todo:UpdateTodoDTO):Promise<Todo>;
    delete (id:string):Promise<void>;
}