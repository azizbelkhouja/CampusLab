import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import LabLists from '../components/LabLists'
import Navbar from '../components/Navbar'
import TheaterListsByLab from '../components/TheaterListsByLab'
import { AuthContext } from '../context/AuthContext'

const Lab = () => {
	const { auth } = useContext(AuthContext)
	const [selectedLabIndex, setSelectedLabIndex] = useState(
		parseInt(sessionStorage.getItem('selectedLabIndex')) || 0
	)
	const [labs, setLabs] = useState([])
	const [isFetchingLabs, setIsFetchingLabs] = useState(true)

	const fetchLabs = async (newSelectedLab) => {
		try {
			setIsFetchingLabs(true)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/lab/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/lab')
			}

			setLabs(response.data.data)
			if (newSelectedLab) {
				response.data.data.map((lab, index) => {
					if (lab.name === newSelectedLab) {
						setSelectedLabIndex(index)
						sessionStorage.setItem('selectedLabIndex', index)
					}
				})
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingLabs(false)
		}
	}

	useEffect(() => {
		fetchLabs()
	}, [])

	const props = {
		labs,
		selectedLabIndex,
		setSelectedLabIndex,
		fetchLabs,
		auth,
		isFetchingLabs
	}
	return (
		<div className="flex min-h-screen flex-col gap-4">
			<Navbar />
			<LabLists {...props} />
			{labs[selectedLabIndex]?.name && <TheaterListsByLab {...props} />}
		</div>
	)
}

export default Lab
