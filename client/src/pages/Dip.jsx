import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import DipLists from '../components/DipLists'
import Navbar from '../components/Navbar'
import AulaListsByDip from '../components/AulaListsByDip'
import { AuthContext } from '../context/AuthContext'

const Dip = () => {
	const { auth } = useContext(AuthContext)
	const [selectedDipIndex, setSelectedDipIndex] = useState(
		parseInt(sessionStorage.getItem('selectedDipIndex')) || 0
	)
	const [dips, setDips] = useState([])
	const [isFetchingDips, setIsFetchingDips] = useState(true)

	const fetchDips = async (newSelectedDip) => {
		try {
			setIsFetchingDips(true)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/dip/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/dip')
			}

			setDips(response.data.data)
			if (newSelectedDip) {
				response.data.data.map((dip, index) => {
					if (dip.name === newSelectedDip) {
						setSelectedDipIndex(index)
						sessionStorage.setItem('selectedDipIndex', index)
					}
				})
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingDips(false)
		}
	}

	useEffect(() => {
		fetchDips()
	}, [])

	const props = {
		dips,
		selectedDipIndex,
		setSelectedDipIndex,
		fetchDips,
		auth,
		isFetchingDips
	}
	return (
		<div className="flex min-h-screen flex-col gap-4">
			<Navbar />
			<DipLists {...props} />
			{dips[selectedDipIndex]?.name && <AulaListsByDip {...props} />}
		</div>
	)
}

export default Dip
