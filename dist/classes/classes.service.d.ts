import { UserRole } from "@prisma/client";
import type { CreateClassInput, PatchClassInput, AddParticipantInput } from "./classes.dto.js";
export declare function listResponsibles(): Promise<{
    id: string;
    name: string;
    fullName: string;
    email: string | null;
    role: import("@prisma/client").$Enums.UserRole;
}[]>;
export declare function createClass(data: CreateClassInput, createdByUserId: string | null): Promise<{
    responsible: {
        name: string;
        id: string;
        email: string | null;
        username: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
    participants: ({
        participant: {
            name: string;
            id: string;
            email: string | null;
            status: import("@prisma/client").$Enums.ParticipantStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ClassParticipantStatus;
        createdAt: Date;
        classId: string;
        participantId: string;
        startDate: Date;
        endDate: Date | null;
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
export declare function listClasses(role: UserRole, userId: string): Promise<({
    responsible: {
        name: string;
        id: string;
        email: string | null;
        username: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
    participants: ({
        participant: {
            name: string;
            id: string;
            email: string | null;
            status: import("@prisma/client").$Enums.ParticipantStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ClassParticipantStatus;
        createdAt: Date;
        classId: string;
        participantId: string;
        startDate: Date;
        endDate: Date | null;
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
export declare function getTodayClassForResponsible(userId: string): Promise<{
    name: string;
    id: string;
    day: number;
    time: string;
    responsibleUserId: string;
} | null>;
export declare function getClassById(classId: string, role: UserRole, userId: string): Promise<{
    status: "not_found";
    class?: undefined;
} | {
    status: "forbidden";
    class?: undefined;
} | {
    status: "ok";
    class: {
        responsible: {
            name: string;
            id: string;
            email: string | null;
            username: string;
            passwordHash: string;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        participants: ({
            participant: {
                name: string;
                id: string;
                email: string | null;
                status: import("@prisma/client").$Enums.ParticipantStatus;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                notes: string | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ClassParticipantStatus;
            createdAt: Date;
            classId: string;
            participantId: string;
            startDate: Date;
            endDate: Date | null;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        day: number;
        time: string;
        responsibleUserId: string;
    };
}>;
export declare function patchClass(classId: string, data: PatchClassInput, role: UserRole, userId: string): Promise<({
    responsible: {
        name: string;
        id: string;
        email: string | null;
        username: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
    participants: ({
        participant: {
            name: string;
            id: string;
            email: string | null;
            status: import("@prisma/client").$Enums.ParticipantStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ClassParticipantStatus;
        createdAt: Date;
        classId: string;
        participantId: string;
        startDate: Date;
        endDate: Date | null;
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
export declare function addParticipant(classId: string, data: AddParticipantInput, options?: {
    closeExistingMemberships?: boolean;
}): Promise<{
    participant: {
        name: string;
        id: string;
        email: string | null;
        status: import("@prisma/client").$Enums.ParticipantStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        notes: string | null;
    };
} & {
    id: string;
    status: import("@prisma/client").$Enums.ClassParticipantStatus;
    createdAt: Date;
    classId: string;
    participantId: string;
    startDate: Date;
    endDate: Date | null;
}>;
export declare function removeParticipant(classId: string, participantId: string): Promise<void>;
export declare function listParticipants(classId: string): Promise<{
    createdAt: Date;
    name: string;
    id: string;
    email: string | null;
    status: import("@prisma/client").$Enums.ParticipantStatus;
    updatedAt: Date;
    phone: string | null;
    notes: string | null;
}[]>;
export declare function openSession(classId: string, dateString: string, createdByUserId: string): Promise<{
    members: {
        createdAt: Date;
        name: string;
        id: string;
        email: string | null;
        status: import("@prisma/client").$Enums.ParticipantStatus;
        updatedAt: Date;
        phone: string | null;
        notes: string | null;
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
    updatedAt: Date;
    classId: string;
    sessionDate: Date;
    createdBy: string;
}>;
export declare function listSessions(classId: string, month?: string): Promise<{
    members: {
        attendance: {
            participant: {
                name: string;
                id: string;
                email: string | null;
                status: import("@prisma/client").$Enums.ParticipantStatus;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                notes: string | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            participantId: string;
            justificationReason: string | null;
            recordedBy: string;
        };
        name: string;
        id: string;
        email: string | null;
        status: import("@prisma/client").$Enums.ParticipantStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        notes: string | null;
    }[];
    attendances: ({
        participant: {
            name: string;
            id: string;
            email: string | null;
            status: import("@prisma/client").$Enums.ParticipantStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        participantId: string;
        justificationReason: string | null;
        recordedBy: string;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    classId: string;
    sessionDate: Date;
    createdBy: string;
}[]>;
export declare function getSessionById(classId: string, sessionId: string): Promise<{
    members: {
        attendance: ({
            participant: {
                name: string;
                id: string;
                email: string | null;
                status: import("@prisma/client").$Enums.ParticipantStatus;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                notes: string | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            participantId: string;
            justificationReason: string | null;
            recordedBy: string;
        }) | null;
        createdAt: Date;
        name: string;
        id: string;
        email: string | null;
        status: import("@prisma/client").$Enums.ParticipantStatus;
        updatedAt: Date;
        phone: string | null;
        notes: string | null;
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
    attendances: ({
        participant: {
            name: string;
            id: string;
            email: string | null;
            status: import("@prisma/client").$Enums.ParticipantStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            notes: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string;
        participantId: string;
        justificationReason: string | null;
        recordedBy: string;
    })[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    classId: string;
    sessionDate: Date;
    createdBy: string;
} | null>;
export declare function putBulkAttendance(classId: string, sessionId: string, records: Array<{
    participantId: string;
    status: string;
    notes?: string | null;
}>, recordedBy: string): Promise<({
    participant: {
        name: string;
        id: string;
        email: string | null;
        status: import("@prisma/client").$Enums.ParticipantStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        notes: string | null;
    };
} & {
    id: string;
    status: import("@prisma/client").$Enums.AttendanceStatus;
    createdAt: Date;
    updatedAt: Date;
    sessionId: string;
    participantId: string;
    justificationReason: string | null;
    recordedBy: string;
})[]>;
//# sourceMappingURL=classes.service.d.ts.map