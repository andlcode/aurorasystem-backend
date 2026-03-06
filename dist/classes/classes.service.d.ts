import type { CreateClassInput, PatchClassInput, AddParticipantInput } from "./classes.dto.js";
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
    updatedAt: Date;
    classId: string;
    sessionDate: Date;
    createdBy: string;
}>;
export declare function listSessions(classId: string, month?: string): Promise<{
    month: number;
    year: number;
    weekOfMonth: number;
    present: number;
    absent: number;
    justified: number;
    participantCount: number;
    attendances: {
        status: import("@prisma/client").$Enums.AttendanceStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        participantId: string;
        sessionId: string;
        justificationReason: string | null;
        recordedBy: string;
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
}[]>;
export declare function getSessionById(classId: string, sessionId: string): Promise<{
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
    attendanceMap: {
        [k: string]: {
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
            status: import("@prisma/client").$Enums.AttendanceStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            participantId: string;
            sessionId: string;
            justificationReason: string | null;
            recordedBy: string;
        };
    };
    items: {
        id: string;
        participantId: string;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        justificationReason: string | null;
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
    }[];
    present: number;
    absent: number;
    justified: number;
    attendances: ({
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
        status: import("@prisma/client").$Enums.AttendanceStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        participantId: string;
        sessionId: string;
        justificationReason: string | null;
        recordedBy: string;
    })[];
    class_: {
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
    };
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
}>, recordedBy: string): Promise<{
    items: {
        id: string;
        participantId: string;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        justificationReason: string | null;
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
    }[];
    total: number;
    present: number;
    absent: number;
    justified: number;
}>;
//# sourceMappingURL=classes.service.d.ts.map