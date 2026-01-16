import { useState, useEffect, useRef } from 'react';
import { getTodaysTasks, ITask } from '../services/taskService';
import { toast } from 'sonner';

export const useTaskPolling = (intervalMs = 30000) => {
    return {};
};
