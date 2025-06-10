import baseUrl from "../../config";
import axios from "axios";

export const getAllDocuments = async () => {
  try {
    const response = await axios.get(`${baseUrl}/document/getDocument`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error.response?.data || error.message);
    throw error;
  }
};



export const getDocumentsWithFields = async (docId) => {
    console.log(docId)
  try {
    const response = await axios.get(`${baseUrl}/document/getDocument/${docId}`, {
      withCredentials: true,
    });
    console.log(response.data)
    return response.data;
    
  } catch (error) {
    console.error("Error fetching documents:", error.response?.data || error.message);
    throw error;
  }
};




export const fetchAssignedDocuments = async () => {
  try {
    const response = await axios.get(`${baseUrl}/document/getassignedDocument`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned documents:', error);
    throw error;
  }
};
