import { ArrowsRightLeftIcon, ArrowsUpDownIcon, InformationCircleIcon, UserIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import Loading from './Loading'
import Showtimes from './Showtimes'

const Aula = ({ aulaId, seminari, selectedDate, filterSeminario, setSelectedDate }) => {

	const {
		register,
		handleSubmit,
		setValue,
		watch,
	} = useForm()

	const { auth } = useContext(AuthContext)

	const [aula, setAula] = useState({})
	const [isFetchingAulaDone, setIsFetchingAulaDone] = useState(false)
	const [isAddingShowtime, setIsAddingShowtime] = useState(false)
	const [selectedSeminario, setSelectedSeminario] = useState(null)

	const fetchAula = async (data) => {
		try {
			setIsFetchingAulaDone(false)

			// Chiamate Frontend → Backend
			let response
			if (auth.role === 'admin') {

				response = await axios.get(`/aula/unreleased/${aulaId}`, {
					headers: {
						Authorization: `Bearer ${auth.token}` // JWT per autorizzazione
					}
				})

			} else {
				response = await axios.get(`/aula/${aulaId}`)
			}

			setAula(response.data.data)
			// Fine Chiamate Frontend → Backend

		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingAulaDone(true)
		}
	}

	// chiamare la funzione fetchAula ogni volta che cambia il valore di aulaId
	useEffect(() => {
		fetchAula()
	}, [aulaId])

	// esegue una sola volta all’avvio del componente
	useEffect(() => {
		setValue('autoIncrease', true)
		setValue('rounding5', true)
		setValue('gap', '00:10')
	}, [])

	const onAddShowtime = async (data) => {
		try {
			setIsAddingShowtime(true)
			if (!data.seminario) {
				toast.error('Seleziona un seminario', {
					position: 'top-center',
					autoClose: 2000,
					pauseOnHover: false
				})
				return
			}

			let showtime = new Date(selectedDate)
			const [hours, minutes] = data.showtime.split(':')
			showtime.setHours(hours, minutes, 0)

			const response = await axios.post(
				'/showtime',
				{ seminario: data.seminario, showtime, aula: aula._id, repeat: data.repeat, isRelease: data.isRelease },
				{
					headers: {
						Authorization: `Bearer ${auth.token}` // Bearer : indica che il tipo di token è un token di accesso
					}
				}
			)

			fetchAula()

			if (data.autoIncrease) {
				const seminarioLength = seminari.find((seminario) => seminario._id === data.seminario).length

				const [GapHours, GapMinutes] = data.gap.split(':').map(Number)

				// la data/ora in cui inizierà il prossimo seminario, calcolata dopo la fine del seminario corrente più la pausa.
				const nextShowtime = new Date(showtime.getTime() + (seminarioLength + GapHours * 60 + GapMinutes) * 60000)

				if (data.rounding5 || data.rounding10) {
					const totalMinutes = nextShowtime.getHours() * 60 + nextShowtime.getMinutes()
					const roundedMinutes = data.rounding5 ? Math.ceil(totalMinutes / 5) * 5 : Math.ceil(totalMinutes / 10) * 10

					let roundedHours = Math.floor(roundedMinutes / 60)

					const remainderMinutes = roundedMinutes % 60

					if (roundedHours === 24) {
						nextShowtime.setDate(nextShowtime.getDate() + 1)
						roundedHours = 0
					}
					setValue(
						'showtime',
						`${String(roundedHours).padStart(2, '0')}:${String(remainderMinutes).padStart(2, '0')}`
					)
				} else {
					setValue(
						'showtime',
						`${String(nextShowtime.getHours()).padStart(2, '0')}:${String(
							nextShowtime.getMinutes()
						).padStart(2, '0')}`
					)
				}
				if (data.autoIncreaseDate) {
					setSelectedDate(nextShowtime)
					sessionStorage.setItem('selectedDate', nextShowtime)
				}
			}
			toast.success('Aggiunta seminario riuscita!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Errore durante l\'aggiunta del seminario', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			setIsAddingShowtime(false)
		}
	}

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64
			result = result * 26 + charCode
		}
		return result
	}

	if (!isFetchingAulaDone) {
		return <Loading />
	}

	return (
		<div className="flex flex-col">
			<div className="flex md:justify-between">
				<h3
					className={`flex w-fit items-center border-b-0 bg-black px-6 py-0.5 text-2xl font-bold text-white md:px-8 ${
						auth.role !== 'admin' && 'rounded-t-2xl'
					}`}
				>
					{aula.number}
				</h3>
				{auth.role === 'admin' && (
					<div className="flex w-fit flex-col gap-x-3 border-[2px] px-4 py-0.5 font-semibold border-b-0 text-black md:flex-row md:gap-x-6 md:text-lg md:font-bold">
						<div className="flex items-center gap-2">
							<ArrowsUpDownIcon className="h-5 w-5" />
							{aula?.seatPlan?.row === 'A' ? (
								<h4>Riga : A</h4>
							) : (
								<h4>Riga : A - {aula?.seatPlan?.row}</h4>
							)}
						</div>
						<div className="flex items-center gap-2">
							<ArrowsRightLeftIcon className="h-5 w-5" />
							{aula?.seatPlan?.column === 1 ? (
								<h4>Colonna : 1</h4>
							) : (
								<h4>Colonna : 1 - {aula?.seatPlan?.column}</h4>
							)}
						</div>
						<div className="flex items-center gap-2">
							<UserIcon className="h-5 w-5" />
							{(rowToNumber(aula.seatPlan.row) * aula.seatPlan.column).toLocaleString('it-IT')}{' '}
							Posti
						</div>
					</div>
				)}
			</div>
			<div className="flex flex-col gap-4 border-[2px] py-4">
				{auth.role === 'admin' && (
					<>
						<form
							className="mx-4 flex flex-col gap-x-4 gap-y-2 lg:flex-row"
							onSubmit={handleSubmit(onAddShowtime)}
						>
							<div className="flex grow flex-col gap-2">
								<div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
									<div className="flex grow-[2] items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
										<label className="whitespace-nowrap text-lg font-semibold leading-5">
											Seminario:
										</label>
										<Select
											value={selectedSeminario}
											options={seminari?.map((seminario) => ({
												value: seminario._id,
												label: seminario.name
											}))}
											onChange={(value) => {
												setValue('seminario', value.value)
												setSelectedSeminario(value)
											}}
											isSearchable={true}
											primaryColor="indigo"
											classNames={{
												menuButton: (value) =>
													'flex font-semibold text-sm border'
											}}
										/>
									</div>
									<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
										<label className="whitespace-nowrap text-lg font-semibold leading-5">
											Orario:
										</label>
										<input
											type="time"
											className="h-9 w-full bg-white px-2 py-1 font-semibold text-gray-900 border"
											required
											{...register('showtime', { required: true })}
										/>
									</div>
								</div>
								<div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
									<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
										<label className="whitespace-nowrap font-semibold leading-5">
											Ripeti (Giorni):
										</label>
										<input
											type="number"
											min={1}
											defaultValue={1}
											max={31}
											className="h-9 w-full border px-2 py-1 text-gray-900 drop-shadow-sm"
											required
											{...register('repeat', { required: true })}
										/>
									</div>
									<label className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start">
										Pubblica ora:
										<input
											type="checkbox"
											className="h-6 w-6 lg:h-9 lg:w-9"
											{...register('isRelease')}
										/>
									</label>
									<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
										<p className="text-right underline">Aumento automatico</p>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Dopo l'aggiunta, aggiorna l'orario al termine del seminario"
										>
											Orario:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												{...register('autoIncrease')}
											/>
										</label>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Dopo l'aggiunta, aggiorna la data al termine del seminario"
										>
											Data:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												disabled={!watch('autoIncrease')}
												{...register('autoIncreaseDate')}
											/>
										</label>
									</div>
									<div
										className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start"
										title="Intervallo tra gli orari"
									>
										<label className="whitespace-nowrap font-semibold leading-5">Intervallo:</label>
										<input
											type="time"
											className="h-9 w-full border bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm disabled:bg-gray-300"
											disabled={!watch('autoIncrease')}
											{...register('gap')}
										/>
									</div>
									<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
										<p className="text-right underline">Arrotondamento</p>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Arrotonda ai cinque minuti successivi"
										>
											5-min:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												disabled={!watch('autoIncrease')}
												{...register('rounding5', {
													onChange: () => setValue('rounding10', false)
												})}
											/>
										</label>
										<label
											className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap font-semibold leading-5 lg:flex-col lg:items-start"
											title="Arrotonda ai dieci minuti successivi"
										>
											10-min:
											<input
												type="checkbox"
												className="h-6 w-6 lg:h-9 lg:w-9"
												disabled={!watch('autoIncrease')}
												{...register('rounding10', {
													onChange: () => setValue('rounding5', false)
												})}
											/>
										</label>
									</div>
								</div>
							</div>
							<button
								title="Aggiungi orario"
								disabled={isAddingShowtime}
								className="whitespace-nowrap bg-black px-2 py-1 font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
								type="submit"
							>
								AGGIUNGI +
							</button>
						</form>
						{filterSeminario?.name && (
							<div className="mx-4 flex gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 p-2 text-white">
								<InformationCircleIcon className="h-6 w-6" />
								{`Stai visualizzando gli orari di "${filterSeminario?.name}"`}
							</div>
						)}
					</>
				)}
				<Showtimes
					showtimes={aula.showtimes}
					seminari={seminari}
					selectedDate={selectedDate}
					filterSeminario={filterSeminario}
				/>
			</div>
		</div>
	)
}
export default Aula
