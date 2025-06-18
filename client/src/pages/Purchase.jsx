import { TicketIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import ShowtimeDetails from '../components/ShowtimeDetails'
import { AuthContext } from '../context/AuthContext'

const Purchase = () => {
	const navigate = useNavigate()
	const { auth } = useContext(AuthContext)
	const location = useLocation()
	const showtime = location.state.showtime
	const selectedSeats = location.state.selectedSeats || []
	const [isPurchasing, SetIsPurchasing] = useState(false)

	const onPurchase = async (data) => {
		SetIsPurchasing(true)
		try {
			const response = await axios.post(
				`/showtime/${showtime._id}`,
				{ seats: selectedSeats },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			navigate('/dip')
			toast.success('Prenotazione posti riuscita!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error(error.response.data.message || 'Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsPurchasing(false)
		}
	}

	return (
		<div className="flex min-h-screen flex-col gap-4 pb-8 sm:gap-8">
			<Navbar />
			<div className="mx-4 h-fit rounded-lg p-4 sm:mx-8 sm:p-6">
				<ShowtimeDetails showtime={showtime} />
				<div className="flex flex-col justify-between text-center text-lg border-2 border-t-0 border-black md:flex-row">
					<div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
						<p className="font-semibold">Posti selezionati : </p>
						<p className="text-start">{selectedSeats.join(', ')}</p>
						{!!selectedSeats.length && <p className="whitespace-nowrap">({selectedSeats.length} posti)</p>}
					</div>
					{!!selectedSeats.length && (
						<button
							onClick={() => onPurchase()}
							className="flex items-center justify-center gap-2 bg-black text-white px-3 disabled:from-slate-500 disabled:to-slate-400"
							disabled={isPurchasing}
						>
							{isPurchasing ? (
								'Processing...'
							) : (
								<>
									<p>Conferma Prenotazione</p>
									<TicketIcon className="h-7 w-7 text-white" />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default Purchase
