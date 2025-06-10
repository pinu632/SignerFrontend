import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../redux/slices/DocumentSlice";


export default function SignerDropdown({ signers, id, onSelect }) {
    const [selectedSigner, setSelectedSigner] = useState("");
    const dispatch = useDispatch()

    const handleChange = (e) => {
        setSelectedSigner(e.target.value);
        onSelect(e.target.value);
        dispatch(updateField({ id: id, updates: { signer: e.target.value } }))

    };

    const sined = useSelector(state => state.document.fields)
    const field = sined.flat().find(e => e.id === id)
    console.log(sined)

    


    return (
        <div className="flex gap-2">
            <label className="block text-[10px] font-medium text-white mb-0.5">Assign signer:</label>
            <select
                value={field?.signer ? field?.signer : selectedSigner}
                onChange={handleChange}
                className="text-[10px] h-[16px] w-[60px] border border-gray-300 rounded-sm px-1 bg-gray-700 focus:outline-none"
            >
                <option value="">--</option>
                {signers.map((signer, index) => (
                    <option key={index} value={signer.email}>
                        {signer.email}
                    </option>
                ))}
            </select>

        </div>
    );
}
