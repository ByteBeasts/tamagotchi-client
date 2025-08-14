import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

// Type definition for `tamagotchi::models::beast::Beast` struct
export interface Beast {
    player: string;
    beast_id: number;
    age: number;
    birth_date: number;
    specie: number;
    beast_type: number;
    name: number;
}

// Type definition for `tamagotchi::models::beast_status::BeastStatus` struct
export interface BeastStatus {
    player: string;
    beast_id: number;
    is_alive: boolean;
    is_awake: boolean;
    hunger: number;
    energy: number;
    happiness: number;
    hygiene: number;
    clean_status: number;
    last_timestamp: number;
}

// Type definition for `tamagotchi::models::food::Food` struct
export interface Food {
    player: string;
    id: number;
    amount: number;
}

// Type definition for `tamagotchi::models::highest_score::HighestScore` struct
export interface HighestScore {
    minigame_id: number;
    player: string;
    score: number;
}

// Type definition for `tamagotchi::models::player::Player` struct
export interface Player {
    address: string;
    name: number;
    current_beast_id: number;
    daily_streak: number;
    total_points: number;
    total_coins: number;
    total_gems: number;
    last_active_day: number;
    creation_day: number;
}

// Type definition for `achievement::events::index::TrophyCreation` struct
export interface TrophyCreation {
    id: number;
    hidden: boolean;
    index: number;
    points: number;
    start: number;
    end: number;
    group: number;
    icon: number;
    title: number;
    description: string;
    tasks: Array<Task>;
    data: string;
}

// Type definition for `achievement::events::index::TrophyProgression` struct
export interface TrophyProgression {
    player_id: number;
    task_id: number;
    count: number;
    time: number;
}

// Type definition for `achievement::types::index::Task` struct
export interface Task {
    id: number;
    total: number;
    description: string;
}

// Type definition for `tamagotchi::events::push::PushToken` struct
export interface PushToken {
    player_address: string;
    token: string;
}

export interface SchemaType extends ISchemaType {
    tamagotchi: {
        Beast: Beast,
        BeastStatus: BeastStatus,
        Food: Food,
        HighestScore: HighestScore,
        Player: Player,
        TrophyCreation: TrophyCreation,
        TrophyProgression: TrophyProgression,
        Task: Task,
        PushToken: PushToken,
    },
}
export const schema: SchemaType = {
    tamagotchi: {
        Beast: {
            player: "",
            beast_id: 0,
            age: 0,
            birth_date: 0,
            specie: 0,
            beast_type: 0,
            name: 0,
        },
        BeastStatus: {
            player: "",
            beast_id: 0,
            is_alive: false,
            is_awake: false,
            hunger: 0,
            energy: 0,
            happiness: 0,
            hygiene: 0,
            clean_status: 0,
            last_timestamp: 0,
        },
        Food: {
            player: "",
            id: 0,
            amount: 0,
        },
        HighestScore: {
            minigame_id: 0,
            player: "",
            score: 0,
        },
        Player: {
            address: "",
            name: 0,
            current_beast_id: 0,
            daily_streak: 0,
            total_points: 0,
            total_coins: 0,
            total_gems: 0,
            last_active_day: 0,
            creation_day: 0,
        },
        TrophyCreation: {
            id: 0,
            hidden: false,
            index: 0,
            points: 0,
            start: 0,
            end: 0,
            group: 0,
            icon: 0,
            title: 0,
            description: "",
            tasks: [{ id: 0, total: 0, description: "", }],
            data: "",
        },
        TrophyProgression: {
            player_id: 0,
            task_id: 0,
            count: 0,
            time: 0,
        },
        Task: {
            id: 0,
            total: 0,
            description: "",
        },
        PushToken: {
            player_address: "",
            token: "",
        },
    },
};
export enum ModelsMapping {
    Beast = 'tamagotchi-Beast',
    BeastStatus = 'tamagotchi-BeastStatus',
    Food = 'tamagotchi-Food',
    HighestScore = 'tamagotchi-HighestScore',
    Player = 'tamagotchi-Player',
    TrophyCreation = 'achievement-TrophyCreation',
    TrophyProgression = 'achievement-TrophyProgression',
    Task = 'achievement-Task',
    PushToken = 'tamagotchi-PushToken',
}