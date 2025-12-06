import { Shield } from "lucide-react";

export function Header() {
    return (
        <header className="h-16 border-b border-zinc-800 bg-black flex items-center px-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Shield className="w-5 h-5 text-orange-500" />
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                    AI <span className="text-zinc-500">Security Scanner</span>
                </h1>
            </div>
        </header>
    );
}
