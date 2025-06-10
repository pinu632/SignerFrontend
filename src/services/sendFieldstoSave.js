import axios from "axios";
import baseUrl from "../../config";

export const SaveFieldsMetaData = async (docId, fields) => {
  try {
    const response = await axios.post(
      `${baseUrl}/document/${docId}/fields/save`,
      { field: fields },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving field metadata:", error);
    throw error;
  }
};
