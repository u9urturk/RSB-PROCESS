import { motion } from "framer-motion";
import { PageTransitionProps, PageVariant } from "../types";

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
            variants={animation}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
