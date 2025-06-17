import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from '../components/Navbar'
import NowShowing from '../components/NowShowing'
import TheaterListsBySeminario from '../components/TheaterListsBySeminario'
import { AuthContext } from '../context/AuthContext'

const Home = () => {
	const { auth } = useContext(AuthContext)
	const [selectedSeminarioIndex, setSelectedSeminarioIndex] = useState(parseInt(sessionStorage.getItem('selectedSeminarioIndex')))
	const [seminari, setSeminari] = useState([])
	const [isFetchingSeminariDone, setIsFetchingSeminariDone] = useState(false)

	const fetchSeminari = async (data) => {
		try {
			setIsFetchingSeminariDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/seminario/unreleased/showing', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/seminario/showing')
			}
			setSeminari(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingSeminariDone(true)
		}
	}

	useEffect(() => {
		fetchSeminari()
	}, [])

	const props = {
		seminari,
		selectedSeminarioIndex,
		setSelectedSeminarioIndex,
		auth,
		isFetchingSeminariDone
	}
	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8">
			<Navbar />
			<NowShowing {...props} />
			{seminari[selectedSeminarioIndex]?.name && <TheaterListsBySeminario {...props} />}
		</div>
	)
}

export default Home
