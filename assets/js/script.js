const App = {
    getTests: async (options = {}) => {
        let query = supabase
            .from('tests')
            .select('*')
            .order('created_at', { ascending: false });

        // Default: only show non-deleted tests, unless includeDeleted is true
        if (!options.includeDeleted) {
            query = query.eq('is_deleted', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching tests:', error);
            return [];
        }
        return data;
    },

    saveTest: async (test) => {
        // Clean the test object - generate ID for new tests
        const testToSave = { ...test };
        if (!testToSave.id || testToSave.id === null) {
            // Generate a simple UUID for new tests
            testToSave.id = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Use upsert to handle both insert and update
        const { data, error } = await supabase
            .from('tests')
            .upsert(testToSave, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('Error saving test:', error);
            throw error; // Throw error so it can be caught
        }
        return data ? data[0] : null;
    },

    deleteTest: async (testId) => {
        // Soft delete: Mark as is_deleted = true instead of removing
        const { error } = await supabase
            .from('tests')
            .update({ is_deleted: true })
            .eq('id', testId);

        if (error) {
            console.error('Error deleting test:', error);
            throw error;
        }
        return true;
    },

    getActiveTestId: async () => {
        // In this simple design, we check for a test with is_active = true
        // Assuming only one test can be active at a time
        const { data, error } = await supabase
            .from('tests')
            .select('id')
            .eq('is_active', true)
            .maybeSingle();

        if (error) console.error('Error getting active test:', error);
        return data ? data.id : null;
    },

    setActiveTestId: async (id) => {
        // First set all to inactive
        await supabase.from('tests').update({ is_active: false }).neq('id', '0'); // Update all

        if (id) {
            // Set specific test to active
            await supabase.from('tests').update({ is_active: true }).eq('id', id);
        }
    },

    getActiveTest: async () => {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .eq('is_active', true)
            .maybeSingle();

        if (error) console.error('Error getting active test:', error);
        return data;
    },

    createResultSession: async (result) => {
        const { data, error } = await supabase
            .from('results')
            .insert([result])
            .select();

        if (error) {
            console.error('Error creating result session:', error);
            return { error };
        }
        return { data: data[0] };
    },

    updateResult: async (id, updates) => {
        const { data, error } = await supabase
            .from('results')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) console.error('Error updating result:', error);
        return data ? data[0] : null;
    },

    getResults: async () => {
        const { data, error } = await supabase
            .from('results')
            .select('*')
            .order('timestamp', { ascending: false });

        return data || [];
    },

    // Delete a single result by ID
    deleteResult: async (id) => {
        console.log('Deleting result with ID:', id);
        const { data, error } = await supabase
            .from('results')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error deleting result:', error);
            throw error;
        }
        console.log('Deleted result:', data);
        return true;
    },

    // Delete all results for a specific test session
    deleteSessionResults: async (testId, sessionId) => {
        console.log('Deleting session results:', { testId, sessionId });

        // First find the results to delete
        let selectQuery = supabase.from('results').select('id').eq('test_id', testId);

        if (sessionId === 'legacy') {
            selectQuery = selectQuery.is('session_id', null);
        } else {
            selectQuery = selectQuery.eq('session_id', sessionId);
        }

        const { data: resultsToDelete, error: selectError } = await selectQuery;

        if (selectError) {
            console.error('Error finding results to delete:', selectError);
            throw selectError;
        }

        console.log('Found results to delete:', resultsToDelete);

        if (!resultsToDelete || resultsToDelete.length === 0) {
            console.log('No results found to delete');
            return true;
        }

        // Delete using the IDs
        const ids = resultsToDelete.map(r => r.id);
        const { data, error } = await supabase
            .from('results')
            .delete()
            .in('id', ids)
            .select();

        if (error) {
            console.error('Error deleting results:', error);
            throw error;
        }

        console.log('Successfully deleted results:', data);
        return true;
    },

    // Student Management
    getStudents: async () => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('registered_at', { ascending: false });

        return data || [];
    },

    saveStudent: async (student) => {
        const { data, error } = await supabase
            .from('students')
            .insert([student])
            .select();

        if (error) {
            console.error('Error saving student:', error);
            alert('Error registering student: ' + error.message);
            return null;
        }
        return data ? data[0] : null;
    },

    generateStudentId: () => {
        return Math.floor(1000000 + Math.random() * 9000000).toString();
    },

    validateStudent: async (id, dob) => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .eq('dob', dob)
            .maybeSingle();

        if (error) console.error('Error validating student:', error);
        return data;
    }
};
