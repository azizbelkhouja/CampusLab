import 'react-toastify/dist/ReactToastify.css'
import Loading from './Loading'

// NowShowing component displays a list of available seminars (seminari)
// Il componente NowShowing mostra un elenco di seminari disponibili (seminari)
const NowShowing = ({ seminari, selectedSeminarioIndex, setSelectedSeminarioIndex, auth, isFetchingSeminariDone }) => {
	return (
		<div className="mx-4 flex flex-col  p-4 text-gray-900 sm:mx-8 sm:p-6">
			<h2 className="text-3xl font-bold text-black">Previsti</h2>
			{isFetchingSeminariDone ? (
				seminari.length ? (
					<div className="mt-1 overflow-x-auto sm:mt-3">
						<div className="mx-auto flex w-fit gap-4">
							{seminari?.map((seminario, index) => {
								return seminari[selectedSeminarioIndex]?._id === seminario._id ? (
									<div
										key={index}
										title={seminario.name}
										className="flex w-[108px] flex-col bg-gray-200 p-1 text-white cursor-pointer drop-shadow-md sm:w-[144px]"
										onClick={() => {
											setSelectedSeminarioIndex(null)
											sessionStorage.setItem('selectedSeminarioIndex', null)
										}}
									>
										<img
											src={seminario.img}
											className="h-36 object-cover sm:h-48"
										/>
										<p className="truncate text-black pt-1 text-center text-sm font-semibold">
											{seminario.name}
										</p>
									</div>
								) : (
									<div
										key={index}
										className="flex w-[108px] flex-col bg-white drop-shadow-md hover:cursor-pointer sm:w-[144px]"
										onClick={() => {
											setSelectedSeminarioIndex(index)
											sessionStorage.setItem('selectedSeminarioIndex', index)
										}}
									>
										<img
											src={seminario.img}
											className="h-36 object-cover drop-shadow-md sm:h-48"
										/>
										<p className="truncate pt-1 text-center text-sm">
											{seminario.name}
										</p>
									</div>
								)
							})}
						</div>
					</div>
				) : (
					<p className="mt-4 text-center">Nessun Seminario disponibile</p>
				)
			) : (
				<Loading />
			)}
		</div>
	)
}

export default NowShowing
