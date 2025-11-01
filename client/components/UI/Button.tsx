import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary";
}

export default function Button({
                                   children,
                                   onClick,
                                   disabled = false,
                                   variant = "primary",
                               }: ButtonProps) {

    const base =
        "w-full py-2 font-medium rounded-xl transition-all duration-200 shadow-sm border active:scale-[0.97]";

    const variants = {
        primary:
            "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800",
        secondary:
            "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100",
    };

    const disabledStyles =
        "opacity-50 cursor-not-allowed pointer-events-none";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${
                disabled ? disabledStyles : "hover:shadow-md"
            }`}
        >
            {children}
        </button>
    );
}
