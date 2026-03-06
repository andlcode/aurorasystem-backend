import type { CreateClassInput, PatchClassInput, AddParticipantInput } from "./classes.dto";
import type { WorkerRole } from "@prisma/client";
export declare function listResponsibles(): Promise<{
    id: string;
    fullName: string;
    role: import("@prisma/client").$Enums.WorkerRole | undefined;
}[]>;
export declare function createClass(data: CreateClassInput, createdByPersonId: string | null): Promise<{
    responsible: {
        worker: {
            function: string;
            role: import("@prisma/client").$Enums.WorkerRole;
            personId: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.PersonType;
        status: import("@prisma/client").$Enums.PersonStatus;
        fullName: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        phone: string | null;
    };
    participants: ({
        participant: {
            type: import("@prisma/client").$Enums.PersonType;
            status: import("@prisma/client").$Enums.PersonStatus;
            fullName: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            birthDate: Date | null;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        participantId: string;
        classId: string;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    day: number;
    time: string;
    responsibleUserId: string;
}>;
export declare function listClasses(role: WorkerRole, personId: string): Promise<({
    responsible: {
        worker: {
            function: string;
            role: import("@prisma/client").$Enums.WorkerRole;
            personId: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.PersonType;
        status: import("@prisma/client").$Enums.PersonStatus;
        fullName: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        phone: string | null;
    };
    participants: ({
        participant: {
            type: import("@prisma/client").$Enums.PersonType;
            status: import("@prisma/client").$Enums.PersonStatus;
            fullName: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            birthDate: Date | null;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        participantId: string;
        classId: string;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    day: number;
    time: string;
    responsibleUserId: string;
})[]>;
export declare function getClassById(classId: string, role: WorkerRole, personId: string): Promise<({
    responsible: {
        worker: {
            function: string;
            role: import("@prisma/client").$Enums.WorkerRole;
            personId: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.PersonType;
        status: import("@prisma/client").$Enums.PersonStatus;
        fullName: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        phone: string | null;
    };
    participants: ({
        participant: {
            type: import("@prisma/client").$Enums.PersonType;
            status: import("@prisma/client").$Enums.PersonStatus;
            fullName: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            birthDate: Date | null;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        participantId: string;
        classId: string;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    day: number;
    time: string;
    responsibleUserId: string;
}) | null>;
export declare function patchClass(classId: string, data: PatchClassInput, role: WorkerRole, personId: string): Promise<({
    responsible: {
        worker: {
            function: string;
            role: import("@prisma/client").$Enums.WorkerRole;
            personId: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.PersonType;
        status: import("@prisma/client").$Enums.PersonStatus;
        fullName: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        phone: string | null;
    };
    participants: ({
        participant: {
            type: import("@prisma/client").$Enums.PersonType;
            status: import("@prisma/client").$Enums.PersonStatus;
            fullName: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            birthDate: Date | null;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        participantId: string;
        classId: string;
    })[];
} & {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    day: number;
    time: string;
    responsibleUserId: string;
}) | null>;
export declare function addParticipant(classId: string, data: AddParticipantInput): Promise<{
    participant: {
        type: import("@prisma/client").$Enums.PersonType;
        status: import("@prisma/client").$Enums.PersonStatus;
        fullName: string;
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        birthDate: Date | null;
        phone: string | null;
    };
} & {
    id: string;
    createdAt: Date;
    participantId: string;
    classId: string;
}>;
export declare function removeParticipant(classId: string, participantId: string): Promise<void>;
export declare function listParticipants(classId: string): Promise<{
    createdAt: Date;
    type: import("@prisma/client").$Enums.PersonType;
    status: import("@prisma/client").$Enums.PersonStatus;
    fullName: string;
    email: string | null;
    id: string;
    updatedAt: Date;
    birthDate: Date | null;
    phone: string | null;
}[]>;
export declare function openSession(classId: string, dateString: string, createdByPersonId: string): Promise<{
    members: {
        createdAt: Date;
        type: import("@prisma/client").$Enums.PersonType;
        status: import("@prisma/client").$Enums.PersonStatus;
        fullName: string;
        email: string | null;
        id: string;
        updatedAt: Date;
        birthDate: Date | null;
        phone: string | null;
    }[];
    class_: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        day: number;
        time: string;
        responsibleUserId: string;
    };
    id: string;
    createdAt: Date;
    classId: string;
    sessionDate: Date;
    createdBy: string;
}>;
export declare function listSessions(classId: string, month: string): Promise<{
    month: number;
    year: number;
    weekOfMonth: number;
    class_: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        day: number;
        time: string;
        responsibleUserId: string;
    };
    id: string;
    createdAt: Date;
    classId: string;
    sessionDate: Date;
    createdBy: string;
}[]>;
//# sourceMappingURL=classes.service.d.ts.map