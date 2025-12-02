const App = {
    getTests: async () => {
        const { data, error } = await supabase
            .from('tests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tests:', error);
            return [];
        }
        return data;
    },

    saveTest: async (test) => {
        // Use upsert to handle both insert and update
        const { data, error } = await supabase
            .from('tests')
            .upsert(test, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('Error saving test:', error);
            throw error; // Throw error so it can be caught
        }
        return data ? data[0] : null;
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
