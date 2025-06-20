import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { TrashIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'

const ShowtimeDetails = ({ showDeleteBtn, showtime, fetchShowtime }) => {

	const { auth } = useContext(AuthContext)
	const navigate = useNavigate()

	const [isDeletingShowtimes, SetIsDeletingShowtimes] = useState(false)
	const [isReleasingShowtime, setIsReleasingShowtime] = useState(false)
	const [isUnreleasingShowtime, setIsUnreleasingShowtime] = useState(false)

	const handleDelete = () => {
		const confirmed = window.confirm(`Vuoi eliminare questo seminario?`)
		if (confirmed) {
			onDeleteShowtime()
		}
	}

	const onDeleteShowtime = async () => {
		try {
			SetIsDeletingShowtimes(true)
			const response = await axios.delete(`/showtime/${showtime._id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})

			navigate('/dip')

			toast.success('Eliminazione seminario avvenuta con successo!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Errore durante l\'eliminazione del seminario', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsDeletingShowtimes(false)
		}
	}

	const handleReleaseShowtime = () => {
		const confirmed = window.confirm(`Vuoi rilasciare questo seminario?`)
		if (confirmed) {
			onReleaseShowtime()
		}
	}

	const onReleaseShowtime = async () => {
		setIsReleasingShowtime(true)
		try {
			const response = await axios.put(
				`/showtime/${showtime._id}`,
				{ isRelease: true },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			await fetchShowtime()
			toast.success(`Rilascio seminario avvenuto con successo!`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Errore durante il rilascio del seminario', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			setIsReleasingShowtime(false)
		}
	}

	const handleUnreleasedShowtime = () => {
		const confirmed = window.confirm(`Vuoi annullare il rilascio di questo seminario?`)
		if (confirmed) {
			onUnreleasedShowtime()
		}
	}

	const onUnreleasedShowtime = async () => {
		setIsUnreleasingShowtime(true)
		try {
			const response = await axios.put(
				`/showtime/${showtime._id}`,
				{ isRelease: false },
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			await fetchShowtime()
			toast.success(`Nascosta seminario avvenuto con successo!`, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Errore durante l\'annullamento del rilascio del seminario', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			setIsUnreleasingShowtime(false)
		}
	}

	return (
		<>
			{showDeleteBtn && auth.role === 'admin' && (
				<div className="mb-4 flex justify-end gap-2">
					{!showtime.isRelease && (
						<button
							title="Modifica nome dipartimento"
							className="flex w-fit items-center gap-1 bg-black py-1 pl-2 pr-1.5 text-sm font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleReleaseShowtime(true)}
							disabled={isReleasingShowtime}
						>
							{isReleasingShowtime ? (
								'Elaborazione...'
							) : (
								<>
									Pubblica
									<EyeIcon className="h-5 w-5" />
								</>
							)}
						</button>
					)}
					{showtime.isRelease && (
						<button
							title="annulla rilascio"
							className="flex w-fit items-center gap-1 bg-blue-900 py-1 pl-2 pr-1.5 text-sm font-medium text-white disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleUnreleasedShowtime(true)}
							disabled={isUnreleasingShowtime}
						>
							{isUnreleasingShowtime ? (
								'Elaborazione...'
							) : (
								<>
									NASCONDI
									<EyeSlashIcon className="h-5 w-5" />
								</>
							)}
						</button>
					)}
					<button
						className="flex w-fit items-center gap-1 bg-red-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:from-slate-500 disabled:to-slate-400"
						onClick={() => handleDelete()}
						disabled={isDeletingShowtimes}
					>
						{isDeletingShowtimes ? (
							'Elaborazione...'
						) : (
							<>
								ELIMINA
								<TrashIcon className="h-5 w-5" />
							</>
						)}
					</button>
				</div>
			)}
			<div className="flex justify-between border border-black border-b-0">
				<div className="flex flex-col justify-center bg-gray-200 px-4 py-0.5 text-center font-bold text-black">
					<p className="text-sm">Aula</p>
					<p className="text-3xl text-black">{showtime?.aula?.number}</p>
				</div>
				<div className="flex w-fit grow items-center justify-center bg-gray-200 px-4 py-0.5 text-center text-xl font-bold text-black sm:text-3xl">
					<p className="mx-auto">{showtime?.aula?.dip.name}</p>
					{!showtime?.isRelease && <EyeSlashIcon className="h-8 w-8" title="Unreleased showtime" />}
				</div>
			</div>
			<div className="flex flex-col md:flex-row border border-black">
				<div className="flex grow flex-col gap-4 sm:py-4">
					<div className="flex items-center">
						<img src={showtime?.seminario?.img} className="w-32 px-4" />
						<div className="flex flex-col">
							<h4 className="mr-4 text-xl font-semibold sm:text-2xl md:text-3xl">
								{showtime?.seminario?.name}
							</h4>
							{showtime?.seminario && (
								<p className="mr-4 font-medium sm:text-lg">
									lunghezza : {showtime?.seminario?.length || '-'} min
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-col">
					<div className="flex h-full min-w-max flex-col items-center justify-center gap-y-1 bg-[#F0F8FF] py-2 text-center text-xl font-semibold sm:py-4 sm:text-2xl md:items-start">
						{showtime?.showtime && (
							<>
								<p className="mx-4 text-lg leading-4">
									{new Date(showtime.showtime).toLocaleDateString('it-IT', {
										weekday: 'long',
									})}
								</p>
								<p className="mx-4">
									{new Date(showtime.showtime).toLocaleDateString('it-IT', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</p>
								<p className="mx-4 bg-[#F0F8FF] text-[#203E72] bg-clip-text text-4xl font-bold sm:text-5xl">
									{new Date(showtime.showtime).toLocaleTimeString('it-IT', {
										hour: '2-digit',
										minute: '2-digit',
										hour12: false,
									})}
								</p>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

export default ShowtimeDetails
