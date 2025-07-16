export interface GimbalData {
    x: number;
    y: number;
    timestamp: number;
}

export interface ConnectionStatus {
    connected: boolean;
    error?: string;
};
    
export {};