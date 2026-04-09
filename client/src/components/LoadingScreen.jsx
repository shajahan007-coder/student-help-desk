import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#ffffff'
        }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
            >
                <ShieldCheck size={48} color="#2563eb" />
                <h1 style={{ fontSize: '2rem', color: '#1e293b', margin: 0 }}>HelpDesk</h1>
            </motion.div>

            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ color: '#2563eb' }}
            >
                <Loader2 size={32} />
            </motion.div>
        </div>
    );
};

export default LoadingScreen;