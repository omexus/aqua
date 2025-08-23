export interface StatementBase {
    fileName: string | null;
    email: string;
    amount: number;
    name: string;
    unit: string
}

export interface StatementSaveRequest extends StatementBase { 
    period?: string;
    from: string;
    to: string;
}

export interface StatementForm extends StatementBase {
    files: File[];
}

export interface StatementResponse extends StatementBase {
    id: string;
    text: string;
    prefix: string;
    fileId: string;
    name: string;
    role: string;
}

export interface PresignedUrl {
    url: string;
    file: File;
}

export interface PeriodSaveRequest{ 
    // unit: string;
    period: string;
    from: string;
    to: string;
    amount: number;
}

export interface PeriodResponse{ 
    id: string;
    from: string;
    to: string;
    amount: number;
}

export interface PeriodWithStatementsResponse{ 
    period: PeriodResponse;
    statements: StatementResponse[];
}
  