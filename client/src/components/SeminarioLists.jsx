import { TrashIcon } from '@heroicons/react/24/solid'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

const SeminarioLists = ({ seminari, search, handleDelete }) => {

	const seminariList = seminari?.filter((seminario) => seminario.name.toLowerCase().includes(search?.toLowerCase() || ''))

	return !!seminariList.length ? (
		<div className="border-2 flex flex-wrap gap-10 p-4">
			{seminariList.map((seminario, index) => {
				return (
					<div key={index} className="flex min-w-fit flex-grow border">
						<img src={seminario.img} className="h-36 object-contain drop-shadow-md sm:h-48" />
						<div className="flex flex-grow flex-col justify-between p-2">
							<div>
								<p className="text-lg font-semibold sm:text-xl">{seminario.name}</p>
								<p>Lunghezza : {seminario.length || '-'} min.</p>
							</div>
							<button
								className="flex w-fit items-center gap-1 self-end bg-red-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-red-600"
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
