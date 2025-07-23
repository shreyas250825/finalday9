export interface User {
    id: number;
    email: string;
    name: string;
    password: string;
    user_type_id: number; // 0 = user, 1 = admin
}