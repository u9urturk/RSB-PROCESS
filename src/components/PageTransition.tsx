import { motion } from "framer-motion";

// Local type definitions
interface PageVariant {
    initial: { opacity: number };
    animate: { opacity: number; transition: { duration: number; ease: string } };
    exit: { opacity: number; transition: { duration: number; ease: string } };
}

interface PageTransitionProps {
    children: React.ReactNode;
    variant?: number;
    className?: string;
}

const pageVariantsList: PageVariant[] = [
    {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
    },
    // Buraya daha fazla varyant eklenebilir
];

const PageTransition: React.FC<PageTransitionProps> = ({ 
    children, 
    variant = 0,
    className = "w-full h-full"
}) => {
    const animation = pageVariantsList[variant] || pageVariantsList[0];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            // Framer Motion typing can be strict; cast animation to any to satisfy Variants typing
            variants={animation as any}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
