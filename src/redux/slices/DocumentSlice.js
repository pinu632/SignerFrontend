import { createSlice } from "@reduxjs/toolkit"




const initialState = {
    document: null,
    fields: []
}

const DocumentSlice = createSlice({
    name: 'Document',
    initialState: initialState,
    reducers: {
        setDocument(state, action) {
            console.log('add document called')
            state.document = action.payload;
            console.log(state.document)

        },
        clearDocument(state) {
            state.document = null;
            state.fields = [];
        },
        addField(state, action) {
            console.log('add field called')
            if (Array.isArray(action.payload)) {
                console.log(action.payload)
                state.fields = action.payload; // Spread the array elements
            } else {
                state.fields.push(action.payload); // Single object
            }
            console.log(state.fields)
        },
        updateField(state, action) {
            console.log('update field called')
            const { id, updates } = action.payload;
            console.log(id,"id")
            
            console.log(updates)
            const index = state.fields.findIndex(f => f.id === id || f.field_id === id);
            console.log('index',index)
            if (index !== -1) {
                state.fields[index] = { ...state.fields[index], ...updates };
            }
        },
        removeField(state, action) {
            state.fields = state.fields.filter(f => (f.id || f.field_id) !== action.payload);
        },
        setFields(state, action) {
            state.fields = action.payload; // replace all fields (useful on load)
        }
    },
})

export const {
    setDocument,
    clearDocument,
    addField,
    updateField,
    removeField,
    setFields
} = DocumentSlice.actions;

export default DocumentSlice.reducer;