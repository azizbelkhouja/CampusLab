import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DipLists from '../components/DipLists'
import DateSelector from '../components/DateSelector'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import ScheduleTable from '../components/ScheduleTable'
import { AuthContext } from '../context/AuthContext'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

const Schedule = () => {

	const { auth } = useContext(AuthContext)

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors }
	} = useForm()

	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)

	const [selectedDipIndex, setSelectedDipIndex] = useState(
		parseInt(sessionStorage.getItem('selectedDipIndex')) || 0
	)

	const [dips, setDips] = useState([])
	const [isFetchingDips, setIsFetchingDips] = useState(true)
	const [seminari, setSeminari] = useState([])
	const [isAddingShowtime, SetIsAddingShowtime] = useState(false)
	const [selectedSeminario, setSelectedSeminario] = useState(null)

	const fetchDips = async (data) => {
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
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingDips(false)
		}
	}

	useEffect(() => {
		fetchDips()
	}, [])

	const fetchSeminari = async (data) => {
		try {
			const response = await axios.get('/seminario')
			setSeminari(response.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchSeminari()
	}, [])

	useEffect(() => {
		setValue('autoIncrease', true)
		setValue('rounding5', true)
		setValue('gap', '00:10')
	}, [])

	const onAddShowtime = async (data) => {
		try {
			SetIsAddingShowtime(true)
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
				{ seminario: data.seminario, showtime, aula: data.aula, repeat: data.repeat, isRelease: data.isRelease },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)

			fetchDips()
			if (data.autoIncrease) {
				const seminarioLength = seminari.find((seminario) => seminario._id === data.seminario).length
				const [GapHours, GapMinutes] = data.gap.split(':').map(Number)
				const nextShowtime = new Date(showtime.getTime() + (seminarioLength + GapHours * 60 + GapMinutes) * 60000)
				if (data.rounding5 || data.rounding10) {
					const totalMinutes = nextShowtime.getHours() * 60 + nextShowtime.getMinutes()
					const roundedMinutes = data.rounding5
						? Math.ceil(totalMinutes / 5) * 5
						: Math.ceil(totalMinutes / 10) * 10
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
			toast.success('Aggiunta dell\'orario riuscita!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsAddingShowtime(false)
		}
	}

	const props = {
		dips,
		selectedDipIndex,
		setSelectedDipIndex,
		fetchDips,
		auth,
		isFetchingDips
	}

	return (
		<div className="flex min-h-screen flex-col gap-4 pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<DipLists {...props} />
			{selectedDipIndex !== null &&
				(dips[selectedDipIndex]?.aulas?.length ? (
					<div className="mx-4 flex flex-col gap-2 bg-white p-4 sm:mx-8 sm:gap-4 sm:p-6">
						<h2 className="text-3xl font-bold text-black">Programma</h2>
						<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
						{auth.role === 'admin' && (
							<form
								className="flex flex-col lg:flex-row gap-4 border p-5 "
								onSubmit={handleSubmit(onAddShowtime)}
							>
								<div className="flex grow flex-col gap-2 rounded-lg">
									<div className="flex flex-col gap-2 rounded-lg lg:flex-row lg:items-stretch">
										<div className="flex grow items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
											<label className="whitespace-nowrap text-lg font-semibold leading-5">
												Aula:
											</label>
											<select
												className="h-9 w-full bg-white px-2 py-1 font-semibold text-gray-900 border"
												required
												{...register('aula', { required: true })}
											>
												<option value="" defaultValue>
													Scegli un'aula
												</option>
												{dips[selectedDipIndex].aulas?.map((aula, index) => {
													return (
														<option key={index} value={aula._id}>
															{aula.number}
														</option>
													)
												})}
											</select>
										</div>
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
										<div className="flex items-center gap-2 lg:flex-col lg:items-start">
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
									<div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
										<div className="flex items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start">
											<label className="whitespace-nowrap text-lg leading-5">
												Ripeti (giorni):
											</label>
											<input
												type="number"
												min={1}
												defaultValue={1}
												max={31}
												className="h-9 w-full border bg-white px-2 py-1 text-gray-900"
												required
												{...register('repeat', { required: true })}
											/>
										</div>
										<label className="flex items-center gap-x-2 gap-y-1 whitespace-nowrap text-lg leading-5 lg:flex-col lg:items-start">
											Rilascia ora:
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
												title="Dopo l'aggiunta, aggiorna l'orario all'orario di fine seminario"
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
												title="Dopo l'aggiunta, aggiorna la data all'orario di fine seminario"
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
												className="h-9 w-full rounded bg-white px-2 py-1 font-semibold text-gray-900 drop-shadow-sm disabled:bg-gray-300"
												disabled={!watch('autoIncrease')}
												{...register('gap')}
											/>
										</div>
										<div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end">
											<p className=" text-right underline">Arrotondamento</p>
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
									className="whitespace-nowrap px-2 bg-black font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
									type="submit"
								>
									AGGIUNGI +
								</button>
							</form>
						)}
						{isFetchingDips ? (
							<Loading />
						) : (
							<div>
								<h2 className="text-2xl font-bold">Aule</h2>
								{dips[selectedDipIndex]?._id && (
									<ScheduleTable
										dip={dips[selectedDipIndex]}
										selectedDate={selectedDate}
										auth={auth}
									/>
								)}
							</div>
						)}
					</div>
				) : (
					<div className="mx-4 flex flex-col gap-2 bg-black p-4 drop-shadow-xl sm:mx-8 sm:gap-4 sm:p-6">
						<p className="text-center text-white"><InformationCircleIcon className="inline-block h-5 w-5 mr-1" />Non ci sono aule disponibili</p>
					</div>
				))}
		</div>
	)
}

export default Schedule
