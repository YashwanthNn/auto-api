// src/server/monitor-routes.js
import { Router } from 'express';
import { supabase } from './supabase-service.js';

const router = Router();

/**
 * 1. POST /api/monitor/check
 * The core function: Pings an external API and records its health metrics.
 */
router.post('/check', async (req, res) => {
    const { monitorId, endpoint } = req.body;
    
    const startTime = Date.now();
    let status = 0;
    let latency = 0;
    let success = false;

    try {
        // 5-second timeout for the external API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(endpoint, { 
            method: 'GET', 
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        latency = Date.now() - startTime;
        status = response.status;
        success = response.ok;

    } catch (error) {
        // Network error, timeout, or DNS failure
        latency = Date.now() - startTime;
        status = 504; // Gateway Timeout/Error placeholder
        success = false;
        console.error(`Check failed for ${endpoint}:`, error.message);
    }

    try {
        // 1. Update Monitor's last status (Using service key, RLS is bypassed)
        await supabase
            .from('monitors')
            .update({
                status: status,
                latency_ms: latency,
                last_checked_at: new Date().toISOString(),
            })
            .eq('id', monitorId);

        // 2. Insert into history
        await supabase.from('history').insert({
            monitor_id: monitorId,
            status: status,
            latency_ms: latency,
        });

        res.json({ success: true, status, latency });

    } catch (dbError) {
        console.error('Database update failed:', dbError);
        res.status(500).json({ success: false, message: 'Database update failed.' });
    }
});


/**
 * 2. GET /api/monitor/history/:id
 * Retrieves the last 60 history records for a monitor (for visualization).
 */
router.get('/history/:monitorId', async (req, res) => {
    const { monitorId } = req.params;
    
    try {
        // Fetch last 60 history records for the latency graph
        const { data, error } = await supabase
            .from('history')
            .select('status, latency_ms, checked_at')
            .eq('monitor_id', monitorId)
            .order('checked_at', { ascending: false })
            .limit(60);

        if (error) throw error;
        
        // Reverse the array so the graph shows oldest to newest
        res.json(data.reverse()); 

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Failed to retrieve monitor history.' });
    }
});


/**
 * 3. POST /api/monitor/demo-failure
 * Hackathon Optimization: Forces a monitor status for demo purposes.
 */
router.post('/demo-failure', async (req, res) => {
    const { monitorId, forceStatus } = req.body; 
    const latency = forceStatus === 500 ? 999 : 50; 

    try {
        // Update Monitor's status and history (Using service key)
        await supabase
            .from('monitors')
            .update({
                status: forceStatus,
                latency_ms: latency,
                last_checked_at: new Date().toISOString(),
            })
            .eq('id', monitorId);

        await supabase.from('history').insert({
            monitor_id: monitorId,
            status: forceStatus,
            latency_ms: latency,
        });

        res.json({ success: true, message: `Status forced to ${forceStatus}` });
    } catch (error) {
        console.error('Demo failure route failed:', error);
        res.status(500).json({ success: false, error: 'Failed to force status' });
    }
});

export default router;