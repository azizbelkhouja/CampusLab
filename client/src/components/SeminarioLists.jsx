import { TrashIcon } from '@heroicons/react/24/solid'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

const SeminarioLists = ({ seminari, search, handleDelete }) => {
	const seminariList = seminari?.filter((seminario) => seminario.name.toLowerCase().includes(search?.toLowerCase() || ''))

	return !!seminariList.length ? (
		<div className="grid grid-cols-1 gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4 drop-shadow-md lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5">
			{seminariList.map((seminario, index) => {
				return (
					<div key={index} className="flex min-w-fit flex-grow rounded-md bg-white drop-shadow-md">
						<img src={seminario.img} className="h-36 rounded-md object-contain drop-shadow-md sm:h-48" />
						<div className="flex flex-grow flex-col justify-between p-2">
							<div>
								<p className="text-lg font-semibold sm:text-xl">{seminario.name}</p>
								<p>Lunghezza : {seminario.length || '-'} min.</p>
							</div>
							<button
								className="flex w-fit items-center gap-1 self-end rounded-md bg-gradient-to-br from-red-700 to-rose-600 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-red-600 hover:to-rose-500"
								onClick={() => handleDelete(seminario)}
							>
								Elimina
								<TrashIcon className="h-5 w-5" />
							</button>
						</div>
					</div>
				)
			})}
		</div>
	) : (
		<div className='text-black'><InformationCircleIcon className="inline-block h-5 w-5 mr-1" />Nessun seminario trovato</div>
	)
}

export default SeminarioLists
